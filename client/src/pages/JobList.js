import { useState, useEffect } from 'react';
import api from '../api/axios';
import JobCard from '../components/JobCard';

const SkeletonCard = () => (
  <div className="skeleton skeleton-card" />
);

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // 300ms Debounce search input to prevent rapid UI layout re-rendering while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsFetching(true);
      try {
        const { data } = await api.get('/jobs', {
          params: { search: debouncedSearch, jobType, page },
        });
        setJobs(data.jobs || []);
        setPages(data.pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
        setIsFetching(false);
      }
    };
    fetchJobs();
  }, [debouncedSearch, jobType, page]);

  return (
    <div className="job-list-page">
      {/* Hero Header */}
      <div className="hero-section">
        <div className="hero-pill">⚡ Intelligent Multi-Age Career Platform</div>
        <h1 className="hero-title">
          Connect with Your <span className="gradient-text">Future Career</span>
        </h1>
        <p className="hero-subtitle">
          Explore curated opportunities across all career stages — internships, entry-level roles, senior positions, freelance gigs, and career-switch programs.
        </p>

        <div className="hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-num">500+</span>
            <span className="hero-stat-label">Active Opportunities</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-num">120+</span>
            <span className="hero-stat-label">Partner Recruiters</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-num">98%</span>
            <span className="hero-stat-label">Placement Rate</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-box">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by job title, skills, or company name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="filter-select"
          value={jobType}
          onChange={(e) => {
            setJobType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
          <option value="Apprenticeship">Apprenticeship</option>
        </select>
      </div>

      {/* Jobs Output */}
      {initialLoading ? (
        <div>
          <div className="job-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="center-msg card glass-card">
          <h3>No matching jobs found</h3>
          <p>Try adjusting your search criteria or clearing filters.</p>
        </div>
      ) : (
        <div style={{ opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.3s ease', minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Available Openings <span style={{ color: '#a5b4fc', fontSize: '0.95rem', fontWeight: 500 }}>({jobs.length})</span>
              {isFetching && <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginLeft: '12px', fontWeight: 400 }}>Updating results...</span>}
            </h3>
          </div>
          <div className="job-grid">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button disabled={page >= pages || isFetching} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default JobList;
