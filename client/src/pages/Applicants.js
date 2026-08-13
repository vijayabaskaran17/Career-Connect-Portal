import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ApplicationTable from '../components/ApplicationTable';

const Applicants = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleStatusChange = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Candidate Applications</h2>
          <p style={{ color: 'var(--text-muted)' }}>Evaluate candidate profiles and update application pipeline status</p>
        </div>
        <Link to="/dashboard" className="btn-small">
          &larr; Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="center-msg">Fetching applicants...</div>
      ) : applications.length === 0 ? (
        <div className="center-msg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <h3>No applications received yet</h3>
          <p>Candidates applying for this opening will appear here.</p>
        </div>
      ) : (
        <ApplicationTable applications={applications} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
};

export default Applicants;
