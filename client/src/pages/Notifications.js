import { useState, useEffect } from 'react';
import api from '../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.log('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/users/notifications/read');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.log('Error marking notifications read:', err);
    }
  };

  return (
    <div className="notifications-page">
      <div className="page-header-banner">
        <div>
          <h1>🔔 Notification Center</h1>
          <p>Real-time updates regarding application status, candidate shortlisting, and career milestones.</p>
        </div>
        <button className="btn-secondary" onClick={handleMarkAllRead}>
          Mark All Read
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="card glass-card empty-state">
          <h3>No notifications yet</h3>
          <p>You will receive updates when recruiters review your applications or new job matches post.</p>
        </div>
      ) : (
        <div className="notif-list-container">
          {notifications.map((n, idx) => (
            <div key={idx} className={`card glass-card notif-card-item ${n.read ? 'read' : 'unread'}`}>
              <div className="notif-card-header">
                <h3>{n.title}</h3>
                <span className="notif-card-date">{new Date(n.date).toLocaleString()}</span>
              </div>
              <p>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
