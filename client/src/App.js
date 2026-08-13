import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import Applicants from './pages/Applicants';
import Profile from './pages/Profile';
import CareerGrowth from './pages/CareerGrowth';
import Practice from './pages/Practice';
import Candidates from './pages/Candidates';
import RecruiterAnalytics from './pages/RecruiterAnalytics';
import UserManagement from './pages/UserManagement';
import Notifications from './pages/Notifications';
import Contact from './pages/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<JobList />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Contact />} />
              <Route
                path="/admin-feedback"
                element={<ProtectedRoute roles={['admin']}><Contact /></ProtectedRoute>}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/growth"
                element={<ProtectedRoute roles={['student']}><CareerGrowth /></ProtectedRoute>}
              />
              <Route
                path="/practice"
                element={<ProtectedRoute roles={['student']}><Practice /></ProtectedRoute>}
              />
              <Route
                path="/my-applications"
                element={<ProtectedRoute roles={['student']}><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/post-job"
                element={<ProtectedRoute roles={['recruiter']}><PostJob /></ProtectedRoute>}
              />
              <Route
                path="/applicants/:jobId"
                element={<ProtectedRoute roles={['recruiter']}><Applicants /></ProtectedRoute>}
              />
              <Route
                path="/candidates"
                element={<ProtectedRoute roles={['recruiter', 'admin']}><Candidates /></ProtectedRoute>}
              />
              <Route
                path="/recruiter-analytics"
                element={<ProtectedRoute roles={['recruiter', 'admin']}><RecruiterAnalytics /></ProtectedRoute>}
              />
              <Route
                path="/users-management"
                element={<ProtectedRoute roles={['admin']}><UserManagement initialTab="users" /></ProtectedRoute>}
              />
              <Route
                path="/admin-applications"
                element={<ProtectedRoute roles={['admin']}><UserManagement initialTab="applications" /></ProtectedRoute>}
              />
              <Route
                path="/notifications"
                element={<ProtectedRoute><Notifications /></ProtectedRoute>}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
