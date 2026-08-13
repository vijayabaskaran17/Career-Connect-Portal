import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Logo variant="full" size={36} />
            </Link>
            <p className="footer-desc">
              CareerConnect is an AI-powered multi-stage career discovery platform connecting candidates with global recruiters, skill workouts, and AI resume matching.
            </p>
            <div className="footer-badge-pill">
              <span>🌐 Next-Gen Hiring Ecosystem</span>
            </div>
          </div>

          {/* Candidates / Job Seekers */}
          <div className="footer-links-col">
            <h4>For Candidates</h4>
            <ul>
              <li><Link to="/jobs">Browse Verified Jobs</Link></li>
              <li><Link to="/growth">Career Roadmap</Link></li>
              <li><Link to="/practice">Skill Workouts & Quiz</Link></li>
              <li><Link to="/my-applications">My Applications</Link></li>
              <li><Link to="/contact">Candidate Support</Link></li>
            </ul>
          </div>

          {/* Recruiters & Employers */}
          <div className="footer-links-col">
            <h4>For Recruiters</h4>
            <ul>
              <li><Link to="/post-job">Post New Opening</Link></li>
              <li><Link to="/candidates">Candidate Search</Link></li>
              <li><Link to="/recruiter-analytics">Hiring Analytics</Link></li>
              <li><Link to="/contact">Recruiter Support</Link></li>
            </ul>
          </div>

          {/* Quick Contact & Feedback */}
          <div className="footer-links-col">
            <h4>Contact & Feedback</h4>
            <p className="footer-subtext">Have questions or feedback for our team? Send feedback directly to platform admin.</p>
            <Link to="/contact" className="btn-footer-contact">
              📩 Contact Us & Give Feedback
            </Link>
            <div className="contact-meta-info">
              <div>📧 support@careerconnect.com</div>
              <div>⚡ 24/7 Response Time</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} CareerConnect Platform Inc. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <Link to="/contact">Help & Contact</Link>
            <span>•</span>
            <Link to="/jobs">Explore Jobs</Link>
            <span>•</span>
            <Link to="/contact">Platform Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
