import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Logo from './Logo';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ChevronDownIcon = ({ isOpen }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/users/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.log('Error fetching notifications:', err);
    }
  };

  const handleMarkRead = async () => {
    try {
      await api.put('/users/notifications/read');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.log('Error marking notifications read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-wrapper">
          <Logo variant="full" size={38} />
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                Dashboard
              </Link>

              <Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>
                Browse Jobs
              </Link>

              {user.role === 'student' && (
                <>
                  <Link to="/growth" className={isActive('/growth') ? 'active' : ''}>
                    Career Growth
                  </Link>
                  <Link to="/practice" className={isActive('/practice') ? 'active' : ''}>
                    Practice
                  </Link>
                  <Link to="/my-applications" className={isActive('/my-applications') ? 'active' : ''}>
                    Applications
                  </Link>
                </>
              )}

              {user.role === 'recruiter' && (
                <>
                  <Link to="/candidates" className={isActive('/candidates') ? 'active' : ''}>
                    Candidates
                  </Link>
                  <Link to="/recruiter-analytics" className={isActive('/recruiter-analytics') ? 'active' : ''}>
                    Analytics
                  </Link>
                  <Link to="/post-job" className={`btn-nav-primary ${isActive('/post-job') ? 'active' : ''}`}>
                    + Post Job
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/users-management" className={isActive('/users-management') ? 'active' : ''}>
                    User Management
                  </Link>
                  <Link to="/admin-applications" className={isActive('/admin-applications') ? 'active' : ''}>
                    📄 Applications
                  </Link>
                  <Link to="/admin-feedback" className={isActive('/admin-feedback') || isActive('/feedback') ? 'active' : ''}>
                    📬 Feedback Inbox
                  </Link>
                  <Link to="/recruiter-analytics" className={isActive('/recruiter-analytics') ? 'active' : ''}>
                    Analytics
                  </Link>
                </>
              )}

              {/* Notification Bell */}
              <div className="notif-wrapper" ref={notifRef}>
                <button
                  className="notif-bell-btn"
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    if (!showNotifDropdown && unreadCount > 0) {
                      handleMarkRead();
                    }
                  }}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>

                {showNotifDropdown && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && (
                        <button className="btn-text-sm" onClick={handleMarkRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notif-body">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 6).map((n, idx) => (
                          <div key={idx} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                            <div className="notif-item-title">{n.title}</div>
                            <div className="notif-item-msg">{n.message}</div>
                            <div className="notif-item-date">{new Date(n.date).toLocaleDateString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {user.role !== 'admin' && (
                <Link to="/contact" className={isActive('/contact') || isActive('/feedback') ? 'active' : ''}>
                  Contact & Feedback
                </Link>
              )}

              {/* User Account Menu Dropdown */}
              <div className="user-dropdown-wrapper" ref={userRef}>
                <button
                  className={`user-pill-btn ${showUserDropdown ? 'active' : ''}`}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  aria-label="User account menu"
                  title="Account Options"
                >
                  <div className="user-avatar">{getInitials(user.name)}</div>
                  <span className="user-name">{user.name}</span>
                  <span className="role-badge">{user.role}</span>
                  <ChevronDownIcon isOpen={showUserDropdown} />
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="user-avatar-lg">{getInitials(user.name)}</div>
                      <div className="user-info-text">
                        <div className="user-name-bold">{user.name}</div>
                        <div className="user-email-muted">{user.email || 'User Account'}</div>
                        <span className="role-badge-sm">{user.role}</span>
                      </div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link to="/dashboard" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <span>📊</span> Dashboard
                    </Link>
                    <Link to="/profile" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                      <UserIcon /> Edit Profile
                    </Link>
                    <div className="user-dropdown-divider"></div>
                    <button onClick={handleLogout} className="user-dropdown-logout">
                      <LogoutIcon /> Log Out
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Logout Action Button */}
              <button onClick={handleLogout} className="btn-logout" title="Log Out of CareerConnect">
                <LogoutIcon />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>
                Browse Jobs
              </Link>
              <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
                Contact & Support
              </Link>
              <Link to="/login" className={isActive('/login') ? 'active' : ''}>
                Sign In
              </Link>
              <Link to="/register" className="btn-nav-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
