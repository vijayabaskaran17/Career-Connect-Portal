const statusOptions = ['pending', 'shortlisted', 'rejected', 'selected'];

const ApplicationTable = ({ applications, onStatusChange }) => (
  <div className="table-container">
    <table className="app-table">
      <thead>
        <tr>
          <th>Applicant Name</th>
          <th>Email Address</th>
          <th>Skills</th>
          <th>Application Status</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <tr key={app._id}>
            <td style={{ fontWeight: 600 }}>{app.student?.name || 'N/A'}</td>
            <td style={{ color: 'var(--text-muted)' }}>{app.student?.email || 'N/A'}</td>
            <td>
              <div className="skill-tags" style={{ margin: 0 }}>
                {app.student?.skills?.length ? (
                  app.student.skills.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-dark)', fontSize: '0.85rem' }}>No skills listed</span>
                )}
              </div>
            </td>
            <td>
              <select
                className="filter-select"
                style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '130px' }}
                value={app.status}
                onChange={(e) => onStatusChange(app._id, e.target.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ApplicationTable;
